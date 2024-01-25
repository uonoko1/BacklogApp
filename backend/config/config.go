package config

import "os"

var JwtAccessTokenSecret = os.Getenv("SECRETKEY1")
var JwtRefreshTokenSecret = os.Getenv("SECRETKEY2")
