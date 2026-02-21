
package com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smart_ecomernce_api.smart_ecomernce_api.common.base.BaseEntity;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.Order;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.WishlistItem;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_id", columnList = "id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    @NotBlank
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @NotBlank
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank
    @Column(name = "password", nullable = false)
    private String password;


    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;


    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Order> orders;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.REMOVE}, orphanRemoval = true)
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    public void addAddress(Address address) {
        addresses.add(address);
        address.setUser(this);
    }

    public void removeAddress(Address address) {
        addresses.remove(address);
        address.setUser(null);
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WishlistItem> wishlistItems = new ArrayList<>();

    // Helper methods
    public void addToWishlist(WishlistItem item) {
        wishlistItems.add(item);
        item.setUser(this);
    }

    public void removeFromWishlist(WishlistItem item) {
        wishlistItems.remove(item);
        item.setUser(null);
    }

    public int getWishlistSize() {
        return wishlistItems.size();
    }

    @Override
    public String toString() {
        return getFullName() + "(" +

                "email = " + email + ")";
    }
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
