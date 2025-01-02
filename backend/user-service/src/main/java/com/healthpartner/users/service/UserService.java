package com.healthpartner.users.service;


import com.healthpartner.users.dto.*;

import java.util.List;


public interface UserService {

    UserDto saveUser(UserRegistrationDto userDto);
    UserDto getUserByEmail(int userId);
    List<UserDto> getAllUsers();
    UserProfileDto updateUserProfile(int userId, UserProfileDto user);
    void deleteUser(int userId);
    void updatePassword(String email, String password);
    String getPasswordById(int userId);
    boolean getUserStatus(int userId);
    int getUserIdByEmail(String userEmail);
    //leaderboard
    boolean isUniqueUserName(String userName);
    String getUserNameByUserId(int userId);
}
