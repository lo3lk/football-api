package com.example.footballapi.repository;

import com.example.footballapi.dto.Player;
import com.example.footballapi.mapper.PlayerMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class PlayerRepository {

    private final PlayerMapper playerMapper;

    public PlayerRepository(PlayerMapper playerMapper) {
        this.playerMapper = playerMapper;
    }

    public List<Player> findAll() {
        return playerMapper.findAll();
    }
}