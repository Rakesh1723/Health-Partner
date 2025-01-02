package com.healthpartner.users.mapper;


import com.healthpartner.users.dto.*;
import com.healthpartner.users.model.State;
import com.healthpartner.users.model.Users;
import com.healthpartner.users.service.UserServiceImpl;


public class Conversions {

    public static Users UserRegistrationDtoToUser(UserRegistrationDto userRegistrationDto){
        return new Users(0,userRegistrationDto.getUserName()
                          ,userRegistrationDto.getSurName()
                          ,userRegistrationDto.getEmailId()
                          ,userRegistrationDto.getPassword()
                          ,null,null
                          ,userRegistrationDto.getAge()
                          ,userRegistrationDto.getGender()
                          ,userRegistrationDto.getHeight()
                          ,userRegistrationDto.getWeight()
                          ,0,null,null
                          ,userRegistrationDto.getCreatedAt()
                          ,userRegistrationDto.getUpdatedAt()
                          ,State.ACTIVE
        );
    }

    public static UserDto UsersToUserDto(Users user){
        double bmiIndex=UserServiceImpl.bmiIndexGenerator(user.getHeight(),user.getWeight());
        return new UserDto(
                user.getUserId(),
                user.getUserName(),
                user.getSurName(),
                user.getEmailId(),
                user.getPassword(),
                user.getAddress(),
                user.getMobileNo(),
                user.getAge(),
                user.getGender(),
                user.getHeight(),
                user.getWeight(),
                bmiIndex,
                UserServiceImpl.bmiCategoryGenerator(bmiIndex),
                user.getProfilePicUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public static UserProfileDto UserToUserProfileDto(Users user){
        double bmiIndex=UserServiceImpl.bmiIndexGenerator(user.getHeight(),user.getWeight());
            return new UserProfileDto(
                    user.getUserId(),
                    user.getUserName(),
                    user.getSurName(),
                    user.getEmailId(),
                    user.getAddress(),
                    user.getMobileNo(),
                    user.getAge(),
                    user.getGender(),
                    user.getHeight(),
                    user.getWeight(),
                    bmiIndex,
                    UserServiceImpl.bmiCategoryGenerator(bmiIndex),
                    user.getProfilePicUrl(),
                    user.getCreatedAt(),
                    user.getUpdatedAt()
            );
        }
    public static UserDetailsDto UsersToUserDetails(Users user){
        double bmiIndex=UserServiceImpl.bmiIndexGenerator(user.getHeight(),user.getWeight());
        return new UserDetailsDto(
                user.getUserId(),
                user.getUserName(),
                user.getSurName(),
                user.getEmailId(),
                user.getPassword(),
                user.getAddress(),
                user.getMobileNo(),
                user.getAge(),
                user.getGender(),
                user.getHeight(),
                user.getWeight(),
                bmiIndex,
                UserServiceImpl.bmiCategoryGenerator(bmiIndex),
                user.getProfilePicUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                null,null,null
        );
    }


}
