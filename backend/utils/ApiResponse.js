class ApiResponse {
    constructor(statusCode, data, message){
        this.status = statusCode
        this.message = message
        this.data = data
        this.success = statusCode < 500

    }
}
export {ApiResponse}