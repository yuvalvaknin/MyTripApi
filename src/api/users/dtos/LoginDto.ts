interface LoginDto {
    userName : string,
    password : string
}

interface LoginResponseDto {
    userName : string,
    accessToken : string,
    refreshToken : string
}

export { LoginDto, LoginResponseDto }