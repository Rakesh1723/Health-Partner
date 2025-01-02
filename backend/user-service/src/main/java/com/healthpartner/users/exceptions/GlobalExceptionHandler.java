package com.healthpartner.users.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handlerUserNotFoundException(UserNotFoundException ex){
        ProblemDetail response= ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        response.setDetail(ex.getMessage());
        return response;
    }

//    @ExceptionHandler(UserAlreadyExistsException.class)
//    public ProblemDetail handlerUserAlreadyExistsException(UserAlreadyExistsException ex){
//        ProblemDetail response= ProblemDetail.forStatus(HttpStatus.CONFLICT);
//        response.setDetail(ex.getMessage());
//        return response;
//    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ProblemDetail handleDuplicateEmailException(DuplicateEmailException ex) {
        ProblemDetail response = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        response.setDetail(ex.getMessage());
        response.setTitle("Duplicate Email Error");
        response.setProperty("errorCode", "USER_EMAIL_DUPLICATE");
        return response;
    }

}
