package com.example.footballapi.mapper;

import com.example.footballapi.dto.Player;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;

import java.util.List;

@Mapper
public interface PlayerMapper {

    @Select("""
            SELECT id, name, number, position, team, nationality, height, weight
            FROM players
            ORDER BY id
            """)
    List<Player> findAll();

    @Select("""
            SELECT id, name, number, position, team, nationality, height, weight
            FROM players
            WHERE id = #{id}
            """)
    Player findById(long id);

    @Insert("""
            INSERT INTO players
            (name, number, position, team, nationality, height, weight)
            VALUES
            (#{name}, #{number}, #{position}, #{team}, #{nationality}, #{height}, #{weight})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Player player);
}