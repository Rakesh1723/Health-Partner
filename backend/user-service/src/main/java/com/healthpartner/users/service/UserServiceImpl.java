package com.healthpartner.users.service;


import com.healthpartner.users.dto.*;
import com.healthpartner.users.exceptions.DuplicateEmailException;
import com.healthpartner.users.exceptions.UserNotFoundException;
import com.healthpartner.users.feign.DietFeignClient;
import com.healthpartner.users.feign.FitnessFeignClient;
import com.healthpartner.users.feign.GoalFeignClient;
import com.healthpartner.users.feign.WellnessFeignClient;
import com.healthpartner.users.mapper.Conversions;
import com.healthpartner.users.model.BMICategory;
import com.healthpartner.users.model.State;
import com.healthpartner.users.model.Users;
import com.healthpartner.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    UserRepository userRepo;

    @Autowired
    FitnessFeignClient fitnessFeignClient;

    @Autowired
    DietFeignClient dietFeignClient;

    @Autowired
    WellnessFeignClient wellnessFeignClient;

    @Autowired
    GoalFeignClient goalFeignClient;

    public static double bmiIndexGenerator(double height, double weight) {
        return weight/Math.pow(height,2);
    }


    public static BMICategory bmiCategoryGenerator(double bmiIndex) {
        if(bmiIndex<18.5)
            return BMICategory.UNDERWEIGHT;
        else if (bmiIndex < 24.9)
            return BMICategory.NORMAL;
        else if (bmiIndex<29.9)
            return BMICategory.OVERWEIGHT;
        else
            return BMICategory.OBESITY;
    }

    @Override
    public UserDto saveUser(UserRegistrationDto user) {

           if(userRepo.existsByEmailIdAndState(user.getEmailId(),State.ACTIVE))
               throw new DuplicateEmailException("Email " + user.getEmailId() + " is already in use.");

            Users newUser = Conversions.UserRegistrationDtoToUser(user);
            return Conversions.UsersToUserDto(userRepo.save(newUser));
        }

    @Override
    public UserDto getUserByEmail(int userId) {
        Users user = userRepo.findPartnerById(userId).orElseThrow(()->new UserNotFoundException("Users with id "+userId+" not found"));
        return Conversions.UsersToUserDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
           return userRepo.findAllPartners().stream().map(Conversions::UsersToUserDto).toList();
    }


    @Override
    public UserProfileDto updateUserProfile(int userId,UserProfileDto user) {
        Users savedUser = userRepo.findPartnerById(userId).orElseThrow(()->new UserNotFoundException("Users with id "+userId+" not found"));
            if(user.getUserName()!=null)
                savedUser.setUserName(user.getUserName());
            if(user.getSurName()!=null)
                savedUser.setSurName(user.getSurName());
            if (user.getEmailId()!= null)
                savedUser.setEmailId(user.getEmailId());
            if (user.getAddress() != null)
               savedUser.setAddress(user.getAddress());
            if (user.getMobileNo() != null)
                savedUser.setMobileNo(user.getMobileNo());
            if(user.getAge()>0)
                savedUser.setAge(user.getAge());
            if (user.getGender()!=null)
                savedUser.setGender(user.getGender());
            if(user.getHeight()>0)
                savedUser.setHeight(user.getHeight());
            if (user.getWeight()>0)
                savedUser.setWeight(user.getWeight());
            if (user.getProfilePicUrl() != null)
              savedUser.setProfilePicUrl(user.getProfilePicUrl());
            if (user.getUpdatedAt() != null)
              savedUser.setUpdatedAt(user.getUpdatedAt());

            return Conversions.UserToUserProfileDto(userRepo.save(savedUser));
    }

    @Transactional
    @Override
    public void deleteUser(int userId) {
        Users savedUser = userRepo.findPartnerById(userId).orElseThrow(()->new UserNotFoundException("Users with id "+userId+" not found"));
        savedUser.setState(State.INACTIVE);
           fitnessFeignClient.deleteAllFitnessLogByUserId(userId);
           dietFeignClient.deleteAllDietLogsByUserId(userId);
           wellnessFeignClient.deleteAllWellnessLogsByUserId(userId);
           goalFeignClient.deleteAllGoalLogsByUserId(userId);
           userRepo.save(savedUser);
    }

    @Override
    public void updatePassword(String email, String password) {
        int userId=getUserIdByEmail(email);
        Users user = userRepo.findPartnerById(userId).orElseThrow(()->new UserNotFoundException("Users with email "+email+" not found"));
        user.setPassword(password);
        userRepo.save(user);
    }

    @Override
    public String getPasswordById(int userId) {
        Users savedUser = userRepo.findPartnerById(userId).orElseThrow(()-> new UserNotFoundException("Users with id "+userId+" not found"));
        return savedUser.getPassword();
    }

    @Override
    public boolean getUserStatus(int userId) {
        if(userRepo.existsByUserIdAndState(userId,State.ACTIVE))
            return true;
        else
            return false;
    }

    @Override
    public int getUserIdByEmail(String userEmail) {
        Users user=userRepo.findByEmailId(userEmail).orElseThrow(()-> new UserNotFoundException("Users with EmailId "+userEmail+" not found"));
        return user.getUserId();
    }

    @Override
    public boolean isUniqueUserName(String userName) {
        Users user = userRepo.findByUserName(userName).orElse(null);
        if (user == null)
            return true;
        return false;
    }

    @Override
    public String getUserNameByUserId(int userId) {
        Users user = userRepo.findById(userId).orElse(null);
        if(user == null)
            return null;
        return user.getUserName();
    }



}
