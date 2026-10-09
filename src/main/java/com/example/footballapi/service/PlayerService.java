package com.example.footballapi.service;

import com.example.footballapi.dto.Player;
import com.example.footballapi.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<Player> findAll() {
        return playerRepository.findAll();
    }

    public Player findById(long id) {
        return playerRepository.findById(id);
    }
}