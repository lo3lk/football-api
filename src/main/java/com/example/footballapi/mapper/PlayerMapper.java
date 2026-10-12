package com.example.footballapi.mapper;

import com.example.footballapi.dto.Player;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PlayerMapper {

    @Select("""
            SELECT id, name, number, position, team, nationality,
                   height, weight, image_path
            FROM players
            ORDER BY id
            """)
    List<Player> findAll();

    @Select("""
            SELECT id, name, number, position, team, nationality,
                   height, weight, image_path
            FROM players
            WHERE id = #{id}
            """)
    Player findById(long id);

    @Insert("""
            INSERT INTO players
            (name, number, position, team, nationality,
             height, weight, image_path)
            VALUES
            (#{name}, #{number}, #{position}, #{team}, #{nationality},
             #{height}, #{weight}, #{imagePath})
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
                weight = #{weight},
                image_path = COALESCE(#{imagePath}, image_path)
            WHERE id = #{id}
            """)
    int update(Player player);

    @Delete("""
            DELETE FROM players
            WHERE id = #{id}
            """)
    int deleteById(long id);
}
