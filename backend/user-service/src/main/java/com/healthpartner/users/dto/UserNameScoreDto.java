package com.healthpartner.users.dto;

public record UserNameScoreDto(
        int userId, String userName, Double score
) {
}
