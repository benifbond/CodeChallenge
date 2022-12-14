

    // Constant-Roman and Arabic mapping, basic conversion rules
    const RomanNumEquivalent = {
        'I' : 1,
        'V' : 5,
        'X' : 10,
        'L' : 50,
        'C' : 100,
        'D' : 500,
        'M' : 1000
    };
    // Constants - base characters for Roman characters
    const RomanNumEquivalentKeys = ['I','V','X','L','C','D','M'];
    // Storage of Roman designations: [alias1, alias2...] , the alias corresponds to RomanNumEquivalentKeys instead of the character index
    let romanNumDesignations = new Array(RomanNumEquivalentKeys.length);
    // Store item unit price, {item name1:unit price, item name2:unit price
    let unitPrice = {};

     /**
      Verify that the text conforms to the Roman Numerals rule
      * Roman Numerals; individual characters are repeated no more than three times in a row; even digits can be subtracted and the subtracted number does not exceed the next subtracted number
      */
    function verifyRomanNum(validateChar){
        if(!validateChar.match(/[^IVXLCDM]/i) // Roman character verification
            && !validateChar.match(/(\w)\1{3,}/i) // Calibration is forbidden to be repeated more than 3 times
        ){ 
            /** Subtractive strategy checks**/
            let lastDigits = RomanNumEquivalentKeys.indexOf(validateChar.charAt(0));
            for (let i = 1; i < validateChar.length; i++) { 
                let firstDigits = RomanNumEquivalentKeys.indexOf(validateChar.charAt(i));
                if( firstDigits > lastDigits // Subtraction when the first digit is greater than the previous digit
                   && ( lastDigits % 2 > 0 || firstDigits - lastDigits > 2) // Subtraction rules (only the even digits are involved and the number being subtracted does not exceed 2 digits
                ){ 
                    return false;
                }
                lastDigits = firstDigits;
            }
            return true;
        }
        return false;
    }

    /**
     * Conversion of Roman numerals to Arabic numerals
     * :Converted to values by RomanNumEquivalent, left > right values are added and right > left values are subtracted
     
     *  validateChar Roman numeral format characters
     * int Numerical values
     */
    const romanNumToInteger =(validateChar)=> {
        let result = 0;
        let substractValues = RomanNumEquivalent[validateChar.charAt(0)]; // Possible minus values
        let lastDigValues = substractValues; // Record the last bit
        for (let i = 1; i < validateChar.length; i++) {
            let currentChar = validateChar.charAt(i);
            let currentValues = RomanNumEquivalent[currentChar];
            if (currentValues == lastDigValues)
                substractValues += currentValues; //Possible minus, minus cumulative
            else if (currentValues < lastDigValues) {
                result += substractValues; // The current value is less than the previous value, indicating that the previous position is not a decrement, and the previous values are combined
                substractValues = currentValues; // The current bit is set to the possible minus number
            } else {
                substractValues = currentValues - substractValues; // Determined as a minus number 
            }
            lastDigValues = currentValues;
        }
        result += substractValues;
        return result;
    }

    /**
     * Code name/alternate name conversion to Roman characters
     * The codeword array romanNumDesignations is replaced with the Roman character array RomanNumEquivalentKeys with the same index value
     *  aliasTxt Custom alias strings
     *  Corresponding Roman numeral characters
     */
    function aliasRomanNum(aliasTxt){
        let numAlias = aliasTxt.toUpperCase().split(/\s+/);
        numAlias[0] = RomanNumEquivalentKeys[romanNumDesignations.indexOf(numAlias[0])];
        return numAlias.reduce((av,cv,ix)=>av + RomanNumEquivalentKeys[romanNumDesignations.indexOf(cv)]);
    }

    /**
     * Parse the alias set command and return the match {status,message}
     * If the command format matches, status is true and the alias is saved
     */
    function aliasCMD(cmd){
        let response = {status:false,message:''};
        let matArr = cmd.match(/([a-z]+)\s+is\s+([IVXLCDM]+)\s*$/i);
        if(matArr){
            let ix = RomanNumEquivalentKeys.indexOf(matArr[2].toUpperCase());
            if( ix >= 0){
                romanNumDesignations[ix] = matArr[1].toUpperCase();
            }else{
                response.message =`<br/> ${cmd} -> <b>Please specify a single Roman numeral</b>`;
            }
            response.status = true;
        }
        return response;
    }

     /**
      * Parse the price setting command and return the match {status,message}
      * If the command format matches, status is true and the unit price of the item is saved
      */
    function priceCMD(cmd){
        let response = {status:false,message:''};
        let matArr = cmd.match(/(.*)\s+([^\s]+)\s+?is\s+([0-9]+)\s+Credits\s*$/i);
        if( matArr ){ 
            // Mark-up order
            let romanTxt = aliasRomanNum(matArr[1]);
            if(verifyRomanNum(romanTxt)){
                let number = romanNumToInteger(romanTxt);
                unitPrice[matArr[2].toUpperCase()] = matArr[3]/number; // Fractional precision issues are ignored here
            } else {
                response.message =`<br/> ${cmd} -> <b>The quantity is not in the correct format, please adjust the instruction</b>`;
            }
            response.status = true;
        }
        return response;
    }

    /**
     * Parse the command that asks for an alias conversion value, returning the result of the query {status,message}
     *If the command format matches, status is true, message is the calculated value
     */
    function amountOfCMDs(cmd){
        let response = {status:false,message:''};
        let matArr = cmd.match(/how\s+much\s+is\s+(.*?)\s*\?\s*$/i);
        if( matArr ){ 
            // Quantity Inquiry Order 
            let romanTxt = aliasRomanNum(matArr[1]);
            if(verifyRomanNum(romanTxt)){
                let number = romanNumToInteger(romanTxt);
                response.message =`<br/> ${cmd} -> <b>${matArr[1]} is ${number}</b>`;
            } else {
                response.message =`<br/> ${cmd} -> <b>The quantity is not in the correct format, please adjust the instruction</b>`;
            }
            response.status = true;
        }
        return response;
    }

     /**
      * Parses a command asking for the price of an item and returns the result of the inquiry {status,message}
      * If the command format matches, status is true,message is Price=unit price*quantity
      */
    const amountOfCMD =(cmd)=>{
        let response = {status:false,message:''};
        let matArr = cmd.match(/how\s+many\sCredits\s+is\s+(.*)\s+([^\s]+?)\s*\?\s*$/i);
        if( matArr ){ 
            // Price Enquiry Order
            let romanTxt = aliasRomanNum(matArr[1]);
            if(verifyRomanNum(romanTxt)){
                let number = romanNumToInteger(romanTxt);
                let price = unitPrice[matArr[2].toUpperCase()];
                if(price){
                    response.message =`<br/> ${cmd} -> <b>${matArr[1]} ${matArr[2]} is ${price*number} Credits</b>`;
                } else {
                    response.message =`<br/> ${cmd} -> <b>I don't know the price of ${matArr[2]}</b>`;
                }
                response.status = true;
            } else {
                message =`<br/> ${cmd} -> <b>The quantity is not in the correct format, please adjust the instruction</b>`;
            }
        }
        return response;
    }
    
    /**
     * Parse a command, match the supported command formats one by one, and output the result
 
     */
    function messageText(cmd){
        let message;
        try{
            if(cmd && cmd.trim()){
                let tallyCmd = [aliasCMD,priceCMD,amountOfCMDs,amountOfCMD];
                let result;
                for( let i = 0 ; i < tallyCmd.length ; i++ ){
                    result = tallyCmd[i](cmd);
                    if(result.status) break;
                }
               message = result.status?result.message:`<br/> ${cmd} -> <b>I have no idea what you are talking about</b>`;  
            }
        } catch(e) {
            message =`<br/> ${cmd} -> <b>I have no idea what you are talking about</b>`;
        }
        return message;
    }
    
    /**
     * Parsing a batch of commands, splitting them into individual commands and executing them via \n
    
     */
    function commandDiary(){
        let validateChar = testData.value;
        if(validateChar && validateChar.trim()){
            let commandArr = validateChar.split("\n");
            let message = "<b>Test Output:</b>";
            commandArr.forEach( cmd =>{ 
                // Line by line analysis
                message += messageText(cmd);
            });
            
            divResult.innerHTML = message;
        } else {
            divResult.innerHTML = "No content, please enter instructions";
        }
    }
