package com.example.footballapi.controller;

import com.example.footballapi.dto.Player;
import com.example.footballapi.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<Player> createPlayer(@RequestBody Player player) {
        playerService.insert(player);
        return ResponseEntity.status(201).body(player);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(
            @PathVariable long id,
            @RequestBody Player player) {

        player.setId(id);

        int result = playerService.update(player);

        if (result == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(player);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable long id) {
        int result = playerService.deleteById(id);

        if (result == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}