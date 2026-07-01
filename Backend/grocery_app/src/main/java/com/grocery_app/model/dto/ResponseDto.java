package com.grocery_app.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
// Dòng này cực kỳ quan trọng: Nếu trường nào bị null (ví dụ trả về 1 sản phẩm không có metaData), 
// Spring Boot sẽ tự động ẩn nó đi khỏi file JSON trả về.
@JsonInclude(JsonInclude.Include.NON_NULL) 
public class ResponseDto<T> {
    
    private boolean success;
    
    private String message;
    
    private T data;
    
    private MetaData metaData;
}