package com.example.footballapi.mapper;

import com.example.footballapi.dto.Player;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PlayerMapper {

    @Select("""
        
            SELECT id, name, number, position, team, nationality, height, weight
        FROM players
        ORDER BY id
        """)
    List<Player> findAll();
}