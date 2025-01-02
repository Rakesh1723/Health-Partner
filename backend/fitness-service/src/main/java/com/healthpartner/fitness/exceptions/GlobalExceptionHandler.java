package com.healthpartner.fitness.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FitnessLogNotFoundException.class)
    public ProblemDetail handlerFitnessLogNotFoundException(FitnessLogNotFoundException ex){
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
