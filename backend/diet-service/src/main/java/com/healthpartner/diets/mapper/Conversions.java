package com.healthpartner.diets.mapper;


import com.healthpartner.diets.dto.DietLogDto;
import com.healthpartner.diets.model.DietLog;

public class Conversions {
    public static DietLog DietLogDtoToDietLog(DietLogDto DietLogDto){
        return new DietLog(0,0
                   ,DietLogDto.getMealType()
                   ,DietLogDto.getFoodItems()
                   ,DietLogDto.getProtein()
                   ,DietLogDto.getCarbs()
                   ,DietLogDto.getFat()
                   ,DietLogDto.getCaloriesConsumed()
                   ,DietLogDto.getNotes()
                   ,DietLogDto.getCreatedAt()
                   ,DietLogDto.getUpdatedAt()
                );
    }

    public static DietLogDto DietLogToDietLogDto(DietLog DietLog){
        return new DietLogDto(
                DietLog.getMealType(),
                DietLog.getFoodItems(),
                DietLog.getProtein(),
                DietLog.getCarbs(),
                DietLog.getFat(),
                DietLog.getCaloriesConsumed(),
                DietLog.getNotes(),
                DietLog.getCreatedAt(),
                DietLog.getUpdatedAt()
        );
    }
}
