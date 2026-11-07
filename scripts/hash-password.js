#!/usr/bin/env node

import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

if (process.argv.length < 3) {
  console.error('Usage: node scripts/hash-password.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const saltRounds = 12

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err)
    process.exit(1)
  }

  console.log(hash)
})