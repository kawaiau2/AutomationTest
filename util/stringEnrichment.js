import './util.js';

var converted = '';

function enrich (content, instanceEnv){
    let splitfront = content.toString().split("{{")
    let enriched = splitfront[0];
    for(let i = 1; i < splitfront.length; i++) {
        let splitEnd = splitfront[i].split("}}");
        switch (splitEnd[0].split(';;')[0]){
            case 'hkPhoneGen':
                enriched += hkPhoneGen().toString() + splitEnd[1];
                instanceEnv = instanceEnv.filter(el => el['key'] != splitEnd[0].split(';;')[1]);
                instanceEnv.push({ type:'any', value:converted, key:splitEnd[0].split(';;')[1] });
                break;
            case 'numCommaformat':
                let numWithoutComma = jsonQuery(
                    'data[key=' + splitEnd[0].split(';;')[1] + '].value',
                    {data: {data: instanceEnv}}).value
                enriched += numCommaformat(numWithoutComma) + splitEnd[1];
                break;
            case 'removeComma':
                let withComma = jsonQuery(
                    'data[key=' + splitEnd[0].split(';;')[1] + '].value',
                    {data: {data: instanceEnv}}).value
                enriched += removeComma(withComma) + splitEnd[1];
                break;
            case 'currency':
                let location = jsonQuery(
                    'data[key=' + splitEnd[0].split(';;')[1] + '].value',
                    {data: {data: instanceEnv}}).value
                enriched += locationCurrencyMapping(location,'currency', splitEnd[0].split(';;')[2], instanceEnv) + splitEnd[1];
                break;
            default:
                enriched += jsonQuery(
                    'data[key=' + splitEnd[0] + '].value',
                    {data: {data: instanceEnv}}
                ).value + splitEnd[1];
        }
        
    }
    return enriched;
}

function hkPhoneGen (){
    const dateTime = new Date();
    //current date time Oct 15 15:13 => 90151513
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

export { enrich };