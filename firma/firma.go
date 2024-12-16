package main

import (
    "crypto/hmac"
    "crypto/rand"
    "crypto/sha256"
    "encoding/base64"
    "encoding/hex"
    "flag"
    "fmt"
    "io"
    "log"
    "os"
    "path/filepath"
    "time"
)

type SigningKey struct {
    Key       string    `json:"key"`
    CreatedAt time.Time `json:"created_at"`
}

func generateRandomKey(length int) string {
    bytes := make([]byte, length)
    if _, err := rand.Read(bytes); err != nil {
        log.Fatal("Error generating random key:", err)
    }
    return base64.URLEncoding.EncodeToString(bytes)[:length]
}

func createSignature(filePath string, key string) (string, error) {
    file, err := os.Open(filePath)
    if err != nil {
        return "", fmt.Errorf("error opening file: %v", err)
    }
    defer file.Close()

    h := hmac.New(sha256.New, []byte(key))
    if _, err := io.Copy(h, file); err != nil {
        return "", fmt.Errorf("error creating signature: %v", err)
    }

    return hex.EncodeToString(h.Sum(nil)), nil
}

func saveKeyToFile(key string, outputPath string) error {
    return os.WriteFile(outputPath, []byte(key), 0600)
}

func main() {
    generateCmd := flag.Bool("generate", false, "Generate a new signing key")
    signCmd := flag.Bool("sign", false, "Sign a file")
    keyPath := flag.String("key", "", "Path to the key file")
    filePath := flag.String("file", "", "Path to the file to sign")
    outputPath := flag.String("output", "", "Output path for key file")
    flag.Parse()

    if *generateCmd {
        key := generateRandomKey(1024)
        if *outputPath == "" {
            *outputPath = "signing_key.txt"
        }
        
        if err := saveKeyToFile(key, *outputPath); err != nil {
            log.Fatal("Error saving key:", err)
        }
        
        fmt.Printf("Key generated and saved to %s\n", *outputPath)
        fmt.Printf("Key: %s\n", key)
        return
    }

    if *signCmd {
        if *keyPath == "" || *filePath == "" {
            log.Fatal("Both key and file paths are required for signing")
        }

        keyBytes, err := os.ReadFile(*keyPath)
        if err != nil {
            log.Fatal("Error reading key file:", err)
        }

        signature, err := createSignature(*filePath, string(keyBytes))
        if err != nil {
            log.Fatal("Error signing file:", err)
        }

        outputFileName := filepath.Base(*filePath) + ".sig"
        if err := os.WriteFile(outputFileName, []byte(signature), 0644); err != nil {
            log.Fatal("Error saving signature:", err)
        }

        fmt.Printf("File signed successfully. Signature saved to %s\n", outputFileName)
        fmt.Printf("Signature: %s\n", signature)
        return
    }

    fmt.Println("Please specify either --generate or --sign")
    flag.PrintDefaults()
}