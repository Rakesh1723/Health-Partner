package com.healthpartner.users.dto;

import com.healthpartner.users.model.BMICategory;
import com.healthpartner.users.model.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDto {

    private int userId;
    private String userName;
    private String surName;
    private String emailId;
    private String address;
    private String mobileNo;
    private int age;
    private Gender gender;
    private double height;
    private double weight;
    private double bmiIndex;
    private BMICategory bmiCategory;

    private String profilePicUrl;
    private Date createdAt;
    private Date updatedAt;

}
