import React, { useEffect, useRef, useState } from 'react'
function OtpForm({ length = 4, onOTPSubmit = () => { } }) {
    const [otp, setOtp] = useState(new Array(length).fill(""))
    const inputRefs = useRef(new Array(length))

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
        
    }, [])

    // console.log(inputRefs)
    // console.log(otp)

    const handleOTPchange = (index, e) => {
        const value = e.target.value

        if (isNaN(value)) return

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1)
        setOtp(newOtp)

        const combinedOtp = newOtp.join("")
        if (combinedOtp.length === length) {
            onOTPSubmit(combinedOtp)
        }

        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus()
        }
    }
    const handleClick = (index) => {
        console.log(inputRefs.current)
        //setselectionrange always keep the cursor at the end
        if (index > length - 1) inputRefs.current[index].setSelectionRange(1, 1);


        //check for if any one previous field is left to fill
        if (index > 0 && !otp[index - 1]) {
            const emptyInputIndex = otp.findIndex((value) => value === "")
            console.log(emptyInputIndex)
            if (emptyInputIndex !== -1 && inputRefs.current[emptyInputIndex]) {
                inputRefs.current[emptyInputIndex].focus()
            } else if(index === 0 && otp[index] === "") { // if first field is empty
                inputRefs.current[index].focus()
            }
        }

        if(index < length - 1 && !otp[index + 1]) {
            const nextEmpty = otp.findIndex((value) => value === "")
            if(nextEmpty !== -1 && inputRefs.current[nextEmpty]) {
                inputRefs.current[nextEmpty].focus()
            }
        }
    }
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            //moving to previous field on backspace
            inputRefs.current[index - 1].focus()
        }
        
    }

    return (
        <div>
            {
                otp.map((value, index) => {
                    return <input
                        type="text"
                        key={index}
                        value={value}
                        onChange = {(e) => handleOTPchange(index, e)}
                        onClick={handleClick(index)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="h-14 w-14 border-2 border-gray-200 rounded-md text-center text-2xl align-middle me-2"
                        ref={(input) => (inputRefs.current[index] = input)}
                    />
                })
            }
        </div>
    )
}

export default OtpForm