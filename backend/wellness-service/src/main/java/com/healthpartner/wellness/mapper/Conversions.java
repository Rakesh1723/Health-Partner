package com.healthpartner.wellness.mapper;


import com.healthpartner.wellness.dto.WellnessLogDto;
import com.healthpartner.wellness.model.WellnessLog;

public class Conversions {
    public static WellnessLog WellnessLogDtoToWellnessLog(WellnessLogDto WellnessLogDto){
        return new WellnessLog(0,0
                   ,WellnessLogDto.getMood()
                   ,WellnessLogDto.getTriggers()
                   ,WellnessLogDto.getSleepDuration()
                   ,WellnessLogDto.getHydration()
                   ,WellnessLogDto.getNotes()
                   ,WellnessLogDto.getCreatedAt()
                   ,WellnessLogDto.getUpdatedAt()
                );
    }
    public static WellnessLogDto WellnessLogToWellnessLogDto(WellnessLog WellnessLog){
        return new WellnessLogDto(
                WellnessLog.getMood(),
                WellnessLog.getTriggers(),
                WellnessLog.getSleepDuration(),
                WellnessLog.getHydration(),
                WellnessLog.getNotes(),
                WellnessLog.getCreatedAt(),
                WellnessLog.getUpdatedAt()
        );
    }
}
