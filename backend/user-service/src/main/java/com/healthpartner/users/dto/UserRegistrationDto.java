package com.healthpartner.users.dto;

import com.healthpartner.users.model.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegistrationDto {

    private String userName;
    private String surName;
    private String password;
    private String emailId;
    private int age;
    private Gender gender;
    private double height;
    private double weight;

    private Date createdAt;
    private Date updatedAt;
}
