package com.grocery_app.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import com.grocery_app.model.dto.MetaData;
import com.grocery_app.model.dto.ResponseDto;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public abstract class GetListPageableService<E, R>{//E: entity, R: response
    private final JpaSpecificationExecutor<E> repository;
    private final ModelMapper mapper;
    private final Class<R> typeR;

    protected List<String> getSearchFields() {
        return List.of("name");
    }

    public ResponseDto<List<R>> getList(Pageable pageable) {
        return getList(pageable, null);
    }

    public ResponseDto<List<R>> getList(Pageable pageable, String querySearch) {
        return getList(pageable, querySearch, null);
    }

    public ResponseDto<List<R>> getList(Pageable pageable, String querySearch, Map<String, Object> filters) {
        log.info("Executing getList with pageable: {}", pageable);

        // 1. Xây dựng Specification (tương đương với Query của MongoDB)
        Specification<E> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            applySearchCriteria(querySearch, root, cb, predicates);
            applyFilterCriteria(filters, root, cb, predicates);
            
            // Hook cho các tiêu chí truy vấn đặc thù của từng Entity
            Predicate customPredicate = applyCustomCriteria(querySearch, filters, root, query, cb);
            if (customPredicate != null) {
                predicates.add(customPredicate);
            }

            // Gộp tất cả các điều kiện lại bằng toán tử AND
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 2. Query Database (JPA sẽ tự động lo việc count và phân trang)
        Page<E> entityPage = repository.findAll(spec, pageable);

        // 3. Tiền xử lý dữ liệu trước khi map (nếu cần)
        prePaging(entityPage.getContent());

        // 4. Build MetaData
        MetaData metaData = MetaData.builder()
                .currentPage(entityPage.getNumber() + 1) // +1 để trả về FE từ trang 1
                .pageSize((long) entityPage.getSize())
                .totalItems(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .build();

        // 5. Map từ Entity sang DTO
        List<R> response = entityPage.getContent().stream()
                .map(entity -> mapper.map(entity, typeR))
                .toList();

        return ResponseDto.<List<R>>builder()
                .success(true)
                .data(response)
                .metaData(metaData)
                .build();
    }

    private void applySearchCriteria(String querySearch, Root<E> root, CriteriaBuilder cb, List<Predicate> predicates) {
        if (querySearch != null && !querySearch.trim().isEmpty() && getSearchFields() != null) {
            List<Predicate> searchPredicates = new ArrayList<>();
            String searchPattern = "%" + querySearch.toLowerCase() + "%";
            
            for (String field : getSearchFields()) {
                // Tạo câu lệnh: LOWER(field) LIKE '%querySearch%'
                searchPredicates.add(cb.like(cb.lower(root.get(field)), searchPattern));
            }
            // Gộp các trường search bằng toán tử OR
            predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
        }
    }

    private void applyFilterCriteria(Map<String, Object> filters, Root<E> root, CriteriaBuilder cb, List<Predicate> predicates) {
        if (filters != null && !filters.isEmpty()) {
            filters.forEach((key, value) -> {
                if (key.startsWith("_")) {
                    return; // Bỏ qua các key hệ thống
                }
                
                if (value instanceof String) {
                    // Nếu là chuỗi thì tìm kiếm tương đối (LIKE) không phân biệt hoa thường
                    predicates.add(cb.like(cb.lower(root.get(key)), "%" + ((String) value).toLowerCase() + "%"));
                } else {
                    // Nếu là số/boolean/enum thì tìm kiếm tuyệt đối (EQUAL)
                    predicates.add(cb.equal(root.get(key), value));
                }
            });
        }
    }

    // Các class con có thể Override hàm này để thêm logic Filter phức tạp (VD: >=, <=, JOIN bảng)
    protected Predicate applyCustomCriteria(String querySearch, Map<String, Object> filters, 
                                            Root<E> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        return null; 
    }

    protected void prePaging(List<E> entities) {
    }
}
