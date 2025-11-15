#!/bin/bash

# Kullanıcıdan commit mesajını al
read -p "Commit mesajını girin: " message

# git add . komutunu çalıştır
git add .

# git commit --allow-empty komutunu çalıştır
git commit --allow-empty -m "$message"

# git push origin master komutunu çalıştır
git push origin master
