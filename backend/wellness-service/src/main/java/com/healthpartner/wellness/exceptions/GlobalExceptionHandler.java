package com.healthpartner.wellness.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WellnessLogNotFoundException.class)
    public ProblemDetail handlerFitnessLogNotFoundException(WellnessLogNotFoundException ex){
        ProblemDetail response= ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        response.setDetail(ex.getMessage());
        return response;
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handlerUserNotFoundException(UserNotFoundException ex){
        ProblemDetail response= ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        response.setDetail(ex.getMessage());
        return response;
    }

}
