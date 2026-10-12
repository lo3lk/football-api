package com.example.footballapi.controller;

import com.example.footballapi.dto.Player;
import com.example.footballapi.service.PlayerService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private final PlayerService playerService;

    @Value("${app.upload.dir:uploads/players}")
    private String uploadDirectory;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<Player>> findAllPlayers() {
        return ResponseEntity.ok(playerService.findAll());
    }

    @GetMapping("/{id}")
    public Player findById(@PathVariable long id) {
        Player player = playerService.findById(id);

        if (player == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "選手が見つかりません");
        }

        return player;
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

    @PostMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Player> uploadImage(
            @PathVariable long id,
            @RequestParam("file") MultipartFile file) {

        Player player = playerService.findById(id);

        if (player == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "選手が見つかりません");
        }

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "画像ファイルを選択してください");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE, "画像は5MB以下にしてください");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "JPEG・PNG・WebPのみ対応しています");
        }

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "対応していない画像形式です");
        };

        Path destination = null;

        try {
            Path uploadPath = Paths.get(uploadDirectory)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + extension;
            destination = uploadPath.resolve(filename).normalize();

            if (!destination.startsWith(uploadPath)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "不正なファイル名です");
            }

            byte[] bytes = file.getBytes();

            // 拡張子だけでなく、実際の画像形式も確認する
            String detectedType = detectImageType(bytes);

            if (!contentType.equals(detectedType)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "画像の内容と形式が一致しません");
            }

            Files.write(destination, bytes);

            String imagePath = "/uploads/players/" + filename;
            int result = playerService.updateImagePath(id, imagePath);

            if (result == 0) {
                Files.deleteIfExists(destination);
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "選手情報を更新できませんでした");
            }

            Player updatedPlayer = playerService.findById(id);
            return ResponseEntity.ok(updatedPlayer);

        } catch (IOException e) {
            if (destination != null) {
                try {
                    Files.deleteIfExists(destination);
                } catch (IOException ignored) {
                    // 元のエラーを優先する
                }
            }

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "画像の保存に失敗しました", e);
        }
    }

    private String detectImageType(byte[] bytes) {
        if (bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        if (bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47
                && bytes[4] == 0x0D
                && bytes[5] == 0x0A
                && bytes[6] == 0x1A
                && bytes[7] == 0x0A) {
            return "image/png";
        }

        if (bytes.length >= 12
                && bytes[0] == 'R'
                && bytes[1] == 'I'
                && bytes[2] == 'F'
                && bytes[3] == 'F'
                && bytes[8] == 'W'
                && bytes[9] == 'E'
                && bytes[10] == 'B'
                && bytes[11] == 'P') {
            return "image/webp";
        }

        return "unknown";
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
