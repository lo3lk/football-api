package com.example.footballapi.dto;

import lombok.Data;

@Data
public class Player {

    private long id;
    private String name;
    private int number;
    private String position;
    private String team;
    private String nationality;
    private double height;
    private double weight;
}