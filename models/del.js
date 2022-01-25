if(diff>0){
        console.log('diff is greater means topGr wins front9');
        const points=diff*frontPoints;
        
        resultObj.pointsFront={
            arr:scoreF.matchArr,
            diff:diff,
            wonBy:'Top Group won front nine',
            points:points
        }
}
    else if(diff<0){
        console.log('diff is less means bottomGr wins front9');
        const points=diff*frontPoints;
        
        resultObj.pointsFront={
            arr:scoreF.matchArr,
            diff:Math.abs(diff),
            wonBy:'Bottom Group won front nine',
            points:Math.abs(points)
        }

    }

    else if(diff==0){
        console.log('diff is 0 means front9 is halved');
        
        resultObj.pointsFront={
            arr:scoreF.matchArr,
            diff:0,
            wonBy:'Match is Halved',
            points:0
        }
    }