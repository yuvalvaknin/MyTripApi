import UserResponseDto from "./UserResponseDto"

interface LoginDto {
    userName : string,
    password : string
}

interface LoginResponseDto extends UserResponseDto {
    accessToken : string,
    refreshToken : string
}

export { LoginDto, LoginResponseDto }