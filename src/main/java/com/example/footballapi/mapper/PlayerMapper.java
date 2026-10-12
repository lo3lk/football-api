package com.example.footballapi.mapper;

import com.example.footballapi.dto.Player;
import org.apache.ibatis.annotations.*;

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

    @Update("""
            UPDATE players
            SET name = #{name},
                number = #{number},
                position = #{position},
                team = #{team},
                nationality = #{nationality},
                height = #{height},
                weight = #{weight}
            WHERE id = #{id}
            """)
    int update(Player player);
}