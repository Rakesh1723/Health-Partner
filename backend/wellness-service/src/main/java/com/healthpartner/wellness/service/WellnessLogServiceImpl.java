package com.healthpartner.wellness.service;

import com.healthpartner.wellness.dto.SleepDto;
import com.healthpartner.wellness.dto.WellnessLogDto;
import com.healthpartner.wellness.exceptions.UserNotFoundException;
import com.healthpartner.wellness.exceptions.WellnessLogNotFoundException;
import com.healthpartner.wellness.fiegn.UserFeignClient;
import com.healthpartner.wellness.mapper.Conversions;
import com.healthpartner.wellness.model.WellnessLog;
import com.healthpartner.wellness.repository.WellnessLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WellnessLogServiceImpl implements WellnessLogService {


    @Autowired
    WellnessLogRepository wellnessLogRepo;

    @Autowired
    UserFeignClient userFeignClient;


    @Override
    public WellnessLogDto saveWellnessLog(WellnessLogDto WellnessLogDto, int userId) {
       if(userFeignClient.getUserStatus(userId))
       { WellnessLog WellnessLog= Conversions.WellnessLogDtoToWellnessLog(WellnessLogDto);
         WellnessLog.setUserId(userId);
         WellnessLog= wellnessLogRepo.save(WellnessLog);
         return Conversions.WellnessLogToWellnessLogDto(WellnessLog);
       }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");

}

    @Override
    public WellnessLogDto getWellnessLogById(int logId) {
        WellnessLog savedWellnessLog = wellnessLogRepo.findById(logId).orElseThrow(()->new WellnessLogNotFoundException("WellnessLog with id "+logId+" not found"));
        return Conversions.WellnessLogToWellnessLogDto(savedWellnessLog);
    }

    @Override
    public WellnessLogDto updateWellnessLog(int logId,WellnessLogDto WellnessLogDto,int userId) {
        WellnessLog savedWellnessLog = wellnessLogRepo.findById(logId).orElseThrow(()->new WellnessLogNotFoundException("WellnessLog with id "+logId+" not found"));

        if(!userFeignClient.getUserStatus(userId) || savedWellnessLog.getUserId()!=userId){
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
        }

        if (WellnessLogDto.getMood() != null) {
            savedWellnessLog.setMood(WellnessLogDto.getMood());
        }

        if (WellnessLogDto.getTriggers() != null) {
            savedWellnessLog.setTriggers(WellnessLogDto.getTriggers());
        }

        if (WellnessLogDto.getSleepDuration() > 0) {
            savedWellnessLog.setSleepDuration(WellnessLogDto.getSleepDuration());
        }

        if (WellnessLogDto.getHydration() > 0) {
            savedWellnessLog.setHydration(WellnessLogDto.getHydration());
        }

        if (WellnessLogDto.getUpdatedAt() != null) {
            savedWellnessLog.setUpdatedAt(WellnessLogDto.getUpdatedAt());
        }
        savedWellnessLog.setNotes(WellnessLogDto.getNotes());

        return Conversions.WellnessLogToWellnessLogDto(wellnessLogRepo.save(savedWellnessLog));
    }

    @Override
    public void deleteWellnessLog(int logId,int userId) {
        WellnessLog savedWellnesslog = wellnessLogRepo.findById(logId).orElseThrow(()->new WellnessLogNotFoundException("WellnessLog with id "+logId+" not found"));
        if(userFeignClient.getUserStatus(userId) && savedWellnesslog.getUserId()==userId)
            wellnessLogRepo.deleteById(logId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found or access denied");
    }

    @Override
    public List<WellnessLog> getAllWellnessLogs() {
        return wellnessLogRepo.findAll();
    }

    @Override
    public List<WellnessLog> getAllWellnessLogsByUserId(int userId) {
        if(userFeignClient.getUserStatus(userId))
            return wellnessLogRepo.findAllByUserId(userId).stream().toList();
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    @Transactional
    public void deleteAllWellnessLogByUserId(int userId) {
        if(userFeignClient.getUserStatus(userId))
            wellnessLogRepo.deleteAllByUserId(userId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }


    @Override
    public List<WellnessLog> getFilterdLogsByWellness(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
            return wellnessLogRepo.getFilteredLogsByWellness(userId,startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }


    @Override
    public List<SleepDto> getWeeklySleepReportForMonth(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
            return wellnessLogRepo.getWeeklySleepReportForMonth(userId, startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<SleepDto> getMonthlySleepReportForYear(int userId, LocalDate startDate, LocalDate endDate) {
        if(userFeignClient.getUserStatus(userId)) {
            return wellnessLogRepo.getMonthlySleepReportForYear(userId, startDate, endDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public Double getTotalHydration(int userId, LocalDate day) {
        if(userFeignClient.getUserStatus(userId)) {
            return wellnessLogRepo.getTotalHydrationByUserAndDate(userId, day);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public Double getTotalSleepDuration(int userId, LocalDate day) {
        if(userFeignClient.getUserStatus(userId)) {
            return wellnessLogRepo.getTotalSleepDurationByUserAndDate(userId, day);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }


}
