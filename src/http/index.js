export const httpGet = async (theUrl) => {
    const responseData = {
        error: false,
        msg: '',
        data: undefined,
    }
    try {
        const response = await fetch(theUrl)
        const { status } = response
        if (status !== 200) {
            responseData.err = true
            responseData.msg = 'Error status: ' + status
            return responseData
        }
        const parsed = await response.json()
        responseData.data = parsed
        return responseData;
    } catch (error) {
        responseData.err = true
        responseData.msg = error
        return responseData
    }
} 