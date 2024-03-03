import './util.js';

var converted = '';
var enrichedInstanceEnv = {};

function enrich (content, instanceEnv){
    enrichedInstanceEnv = instanceEnv;
    let splitfront = content.toString().split("{{")
    let enriched = splitfront[0];
    for(let i = 1; i < splitfront.length; i++) {
        let splitEnd = splitfront[i].split("}}");
        // console.log(splitEnd)
        switch (splitEnd[0].split(';;')[0]){
            case 'hkPhoneGen':
                enriched += hkPhoneGen().toString() + splitEnd[1];
                enrichedInstanceEnv = updateInstanceEnv(enrichedInstanceEnv, splitEnd[0].split(';;')[1], converted);
                break;
            case 'numCommaformat':
                let numWithoutComma = jsonQuery(
                    'data[key=' + splitEnd[0].split(';;')[1] + '].value',
                    {data: {data: enrichedInstanceEnv}}).value
                if(numWithoutComma != null && numWithoutComma != NaN && numWithoutComma != undefined)
                    enriched += numCommaformat(numWithoutComma) + splitEnd[1];
                else
                    enriched += numCommaformat(splitEnd[0].split(';;')[1]) + splitEnd[1];
                break;
            case 'removeComma':
                let withComma = jsonQuery(
                    'data[key=' + splitEnd[0].split(';;')[1] + '].value',
                    {data: {data: enrichedInstanceEnv}}).value
                if (withComma != null && withComma != NaN && withComma != undefined)
                    enriched += removeComma(withComma) + splitEnd[1];
                else
                    enriched += removeComma(splitEnd[0].split(';;')[1])  + splitEnd[1];
                break;
            case 'currency':
                let location = jsonQuery(
                    'data[key=' + splitEnd[0].split(';;')[1] + '].value',
                    {data: {data: enrichedInstanceEnv}}).value
                if (location != null)
                    enriched += locationCurrencyMapping(location,'currency', splitEnd[0].split(';;')[2], enrichedInstanceEnv) + splitEnd[1];
                else
                    enriched += locationCurrencyMapping(splitEnd[0].split(';;')[1],'currency', splitEnd[0].split(';;')[2], enrichedInstanceEnv) + splitEnd[1];
                
                break;
            case 'dynamic':
                let finalKeyName = '';
                splitEnd[0].split(';;')[1].split('||').forEach(el => {
                    if(el.slice(0,2) == "**")
                        finalKeyName += el.slice(2);
                    else
                        finalKeyName += jsonQuery(
                            'data[key=' + el + '].value',
                            {data: {data: enrichedInstanceEnv}}
                        ).value;
                });
                splitEnd[0] = finalKeyName;
            default:
                let defaultEnrich = jsonQuery(
                    'data[key=' + splitEnd[0] + '].value',
                    {data: {data: enrichedInstanceEnv}}
                ).value;
                if (defaultEnrich != null)
                    enriched += defaultEnrich + splitEnd[1];
                else 
                    enriched += splitEnd[0]  + splitEnd[1];
        }
    }
    return enriched;
}

function hkPhoneGen (){
    const dateTime = new Date();
    //current date time Oct 30 15:15:13 => 90151513
    converted = (
        (dateTime.getDate() + 60) * 1000000
        + dateTime.getHours() * 10000
        + dateTime.getMinutes() *100
        + dateTime.getSeconds()
    ).toString();
    return converted;
}

function randomInt(max, len, pad, isFront){
    if(len !=0 || len != null)
        return Math.floor(Math.random() * max).toString();
    else if(isFront == null || isFront)
        return Math.floor(Math.random() * max).toString().padStart(len, pad);
    else
        return Math.floor(Math.random() * max).toString().padEnd(len, pad);
}

function removeComma(number){
    return number.replaceAll(',','');
}

function numCommaformat(number){
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function locationCurrencyMapping(location, valueKey, set, instanceEnv){
    if(!hasData(set))
        set = 'set01';
    let currencyMap = JSON.parse(fs.readFileSync("./config/locationCurrency/" + set + ".json"));
    let language = jsonQuery(
        'data[key=language].value',
        {data: {data: instanceEnv}}).value
    try{
        return currencyMap[location][language][valueKey];
    } catch(e){
        return currencyMap.default[language][valueKey];
    }
}

function getEnrichedInstanceEnv (){
    return enrichedInstanceEnv;
}

export { enrich, getEnrichedInstanceEnv };