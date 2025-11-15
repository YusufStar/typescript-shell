#!/bin/bash

# Kullanıcıdan commit mesajını al
read -p "Commit mesajını girin: " message

# Tüm değişiklikleri ekle
git add .

# Commit oluştur (değişiklik yoksa --allow-empty ile boş commit oluştur)
git commit --allow-empty -m "$message"

# Codecrafters repo'suna push
git push origin master

# Kendi repoya push
git push myrepo master

echo "Push işlemi tamamlandı: hem Codecrafters hem kendi repoya gönderildi."
