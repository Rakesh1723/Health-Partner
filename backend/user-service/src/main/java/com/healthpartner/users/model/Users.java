package com.healthpartner.users.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="Users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;
    @Column(unique = true)
    private String userName;
    private String surName;
    @Column(unique = true)
    private String emailId;
    private String password;
    private String address;
    private String mobileNo;
    private int age;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private double height;
    private double weight;
    @Transient
    private double bmiIndex;
    @Transient
    private BMICategory bmiCategory;
    private String profilePicUrl;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    @Enumerated(EnumType.STRING)
    private State state;

}

