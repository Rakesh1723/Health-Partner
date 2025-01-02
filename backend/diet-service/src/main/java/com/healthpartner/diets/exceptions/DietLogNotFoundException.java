package com.healthpartner.diets.exceptions;

public class DietLogNotFoundException extends RuntimeException{
    public DietLogNotFoundException(String message){
        super(message);
    }
}
