package com.example.footballapi.controller;

import com.example.footballapi.dto.Player;
import com.example.footballapi.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<Player>> findAllPlayers() {
        List<Player> players = playerService.findAll();

        return ResponseEntity.ok(players);
    }

    @GetMapping("/{id}")
    public Player findById(@PathVariable long id) {
        return playerService.findById(id);
    }
}