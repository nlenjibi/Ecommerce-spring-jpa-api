package com.smart_ecomernce_api.smart_ecomernce_api.modules.user.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Data
public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
}
