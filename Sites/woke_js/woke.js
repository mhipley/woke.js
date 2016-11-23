
var er = require('easy-replace');

var elements = document.getElementsByTagName('*');

var dillweeds = require('./woke.json');

function replaceDillweed(dillweed) {
    var random = Math.floor(Math.random() * dillweeds[dillweed].length);
    if (dillweeds[dillweed][random].position == 'before') {
        var dillweedString = '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span> ' + dillweeds[dillweed][random].lastname + '<span></span> ';
    }
    if (dillweeds[dillweed][random].position == 'after') {
        var dillweedString = dillweeds[dillweed][random].lastname + '<span></span>, ' + '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span>, ';
    }
    if (dillweeds[dillweed][random].position == 'replace') {
        var dillweedString = '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span>';
    }
    return dillweedString;

};

function handleTextNode(textNode) {
    if(textNode.nodeName !== '#text') {
        return;
    }

    let origText = textNode.textContent;

    let newHtml=origText

    //HERE IS THE LOGIC FOR REPLACEMENT
        .replace(/Donald Trump /gi, replaceDillweed("Trump"))
        .replace(/Donald Trump, /gi, replaceDillweed("Trump"))
      
        .replace(/Mike Pence /gi, replaceDillweed("Pence"))
        .replace(/Mike Pence, /gi, replaceDillweed("Pence"))

        .replace(/Steve Bannon /gi, replaceDillweed("Bannon"))
        .replace(/Steve Bannon, /gi, replaceDillweed("Bannon"))
        .replace(/Stephen Bannon /gi, replaceDillweed("Bannon"))
        .replace(/Stephen Bannon, /gi, replaceDillweed("Bannon"))     

        .replace(/Jared Kushner /gi, replaceDillweed("Kushner"))
        .replace(/Jared Kushner, /gi, replaceDillweed("Kushner"))

        .replace(/Rudy Giuliani /gi, replaceDillweed("Giuliani"))
        .replace(/Rudy Giuliani, /gi, replaceDillweed("Giuliani"))

        .replace(/Newt Gingrich /gi, replaceDillweed("Gingrich"))
        .replace(/Newt Gingrich, /gi, replaceDillweed("Gingrich"))

        .replace(/Jeff Sessions /gi, replaceDillweed("Sessions"))
        .replace(/Jeff Sessions, /gi, replaceDillweed("Sessions")) 

        .replace(/Kellyanne Conway /gi, replaceDillweed("Conway"))
        .replace(/Kellyanne Conway, /gi, replaceDillweed("Conway"))

        .replace(/Chris Christie /gi, replaceDillweed("Christie"))
        .replace(/Chris Christie, /gi, replaceDillweed("Christie"))

        .replace(/Sarah Palin /gi, replaceDillweed("Palin"))
        .replace(/Sarah Palin, /gi, replaceDillweed("Palin"))

        .replace(/John R\. Bolton /gi, replaceDillweed("Bolton"))
        .replace(/John R\. Bolton, /gi, replaceDillweed("Bolton"))
        .replace(/John Bolton /gi, replaceDillweed("Bolton"))
        .replace(/John Bolton, /gi, replaceDillweed("Bolton")) 

        .replace(/Jeb Hensarling /gi, replaceDillweed("Hensarling"))
        .replace(/Jeb Hensarling, /gi, replaceDillweed("Hensarling"))

        .replace(/Steven Mnunchin /gi, replaceDillweed("Mnunchin"))
        .replace(/Steven Mnunchin, /gi, replaceDillweed("Mnunchin"))

        .replace(/Jan Brewer /gi, replaceDillweed("Brewer"))
        .replace(/Jan Brewer, /gi, replaceDillweed("Brewer"))

        .replace(/Ben Carson /gi, replaceDillweed("Carson"))
        .replace(/Ben Carson, /gi, replaceDillweed("Carson"))

        .replace(/Mike Huckabee /gi, replaceDillweed("Huckabee"))
        .replace(/Mike Huckabee, /gi, replaceDillweed("Huckabee"))  

        .replace(/Bobby Jindal /gi, replaceDillweed("Jindal"))
        .replace(/Bobby Jindal, /gi, replaceDillweed("Jindal"))   

        .replace(/Rick Scott /gi, replaceDillweed("Scott"))
        .replace(/Rick Scott, /gi, replaceDillweed("Scott"))

        .replace(/Joe Arpaio /gi, replaceDillweed("Arpaio"))
        .replace(/Joe Arpaio, /gi, replaceDillweed("Arpaio"))     

        .replace(/David A\. Clark /gi, replaceDillweed("Clark"))
        .replace(/David A\. Clark, /gi, replaceDillweed("Clark")) 
        .replace(/David Clark /gi, replaceDillweed("Clark"))
        .replace(/David Clark, /gi, replaceDillweed("Clark")) 

        .replace(/Paul Ryan /gi, replaceDillweed("Ryan"))
        .replace(/Paul Ryan, /gi, replaceDillweed("Ryan"))

        .replace(/Myron Ebell /gi, replaceDillweed("Ebell"))
        .replace(/Myron Ebell, /gi, replaceDillweed("Ebell"))    

        .replace(/Michelle Rhee /gi, replaceDillweed("Rhee"))
        .replace(/Michelle Rhee, /gi, replaceDillweed("Rhee"))  

        .replace(/Frank Gaffney /gi, replaceDillweed("Gaffney"))
        .replace(/Frank Gaffney, /gi, replaceDillweed("Gaffney"))     

        .replace(/Michael Flynn /gi, replaceDillweed("Flynn"))
        .replace(/Michael Flynn, /gi, replaceDillweed("Flynn"))    

        .replace(/Peter Thiel /gi, replaceDillweed("Thiel"))
        .replace(/Peter Thiel, /gi, replaceDillweed("Thiel"))    

        .replace(/Milo Yiannopoulos /gi, replaceDillweed("Yiannopoulos"))
        .replace(/Milo Yiannopoulos, /gi, replaceDillweed("Yiannopoulos"))                 

        .replace(/Mike Pompeo /gi, replaceDillweed("Pompeo"))
        .replace(/Mike Pompeo, /gi, replaceDillweed("Pompeo")) 

        .replace(/Michael McCaul /gi, replaceDillweed("McCaul"))
        .replace(/Michael McCaul, /gi, replaceDillweed("McCaul"))     

        .replace(/Mike Rogers /gi, replaceDillweed("Rogers"))
        .replace(/Mike Rogers, /gi, replaceDillweed("Rogers"))   

        .replace(/Kris Korbach /gi, replaceDillweed("Korbach"))
        .replace(/Kris Korbach, /gi, replaceDillweed("Korbach"))   

        .replace(/alt-right/gi, replaceDillweed("altright"))
        .replace(/Alt-right/gi, replaceDillweed("altright"))   

        .replace(/white nationalist/gi, replaceDillweed("nationalist"))
        .replace(/white nationalists/gi, replaceDillweed("nationalists")) 

        .replace(/clean coal/gi, replaceDillweed("coal"))
        
        .replace(/anti-vaxxers/gi, replaceDillweed("vax"))     

        .replace(/fake news/gi, replaceDillweed("news"))

        .replace(/make America great again/gi, replaceDillweed("america"))

        .replace(/Tom Price /gi, replaceDillweed("Price"))
        .replace(/Tom Price, /gi, replaceDillweed("Price"));                                              

        // LOGIC FOR LAST NAMES ONLY

      let finalHtml=newHtml  
        .replace(/Trump /gi, replaceDillweed("Trump"))
        .replace(/Trump, /gi, replaceDillweed("Trump"))
      
        .replace(/Pence /gi, replaceDillweed("Pence"))
        .replace(/Pence, /gi, replaceDillweed("Pence"))

        .replace(/Bannon /gi, replaceDillweed("Bannon"))
        .replace(/Bannon, /gi, replaceDillweed("Bannon"))

        .replace(/Kushner /gi, replaceDillweed("Kushner"))
        .replace(/Kushner, /gi, replaceDillweed("Kushner"))

        .replace(/Giuliani /gi, replaceDillweed("Giuliani"))
        .replace(/Giuliani, /gi, replaceDillweed("Giuliani"))

        .replace(/Gingrich /gi, replaceDillweed("Gingrich"))
        .replace(/Gingrich, /gi, replaceDillweed("Gingrich"))

        .replace(/Sessions /gi, replaceDillweed("Sessions"))
        .replace(/Sessions, /gi, replaceDillweed("Sessions")) 

        .replace(/Conway /gi, replaceDillweed("Conway"))
        .replace(/Conway, /gi, replaceDillweed("Conway"))

        .replace(/Christie /gi, replaceDillweed("Christie"))
        .replace(/Christie, /gi, replaceDillweed("Christie"))

        .replace(/Palin /gi, replaceDillweed("Palin"))
        .replace(/Palin, /gi, replaceDillweed("Palin"))

        .replace(/Hensarling /gi, replaceDillweed("Hensarling"))
        .replace(/Hensarling, /gi, replaceDillweed("Hensarling"))

        .replace(/Mnunchin /gi, replaceDillweed("Mnunchin"))
        .replace(/Mnunchin, /gi, replaceDillweed("Mnunchin"))

        .replace(/Huckabee /gi, replaceDillweed("Huckabee"))
        .replace(/Huckabee, /gi, replaceDillweed("Huckabee"))  

        .replace(/Jindal /gi, replaceDillweed("Jindal"))
        .replace(/Jindal, /gi, replaceDillweed("Jindal"))   

        .replace(/Arpaio /gi, replaceDillweed("Arpaio"))
        .replace(/Arpaio, /gi, replaceDillweed("Arpaio"))     

        .replace(/Ebell /gi, replaceDillweed("Ebell"))
        .replace(/Ebell, /gi, replaceDillweed("Ebell"))    

        .replace(/Rhee /gi, replaceDillweed("Rhee"))
        .replace(/Rhee, /gi, replaceDillweed("Rhee"))  

        .replace(/Gaffney /gi, replaceDillweed("Gaffney"))
        .replace(/Gaffney, /gi, replaceDillweed("Gaffney"))        

        .replace(/Thiel /gi, replaceDillweed("Thiel"))
        .replace(/Thiel, /gi, replaceDillweed("Thiel"))    

        .replace(/Yiannopoulos /gi, replaceDillweed("Yiannopoulos"))
        .replace(/Yiannopoulos, /gi, replaceDillweed("Yiannopoulos"))                 

        .replace(/Pompeo /gi, replaceDillweed("Pompeo"))
        .replace(/Pompeo, /gi, replaceDillweed("Pompeo"))  

        .replace(/Korbach /gi, replaceDillweed("Korbach"))
        .replace(/Korbach, /gi, replaceDillweed("Korbach"));  

    // let finalHtml= newHtml

    if( finalHtml !== origText) {
        let newSpan = document.createElement('span');
        newSpan.innerHTML = finalHtml;
        textNode.parentNode.replaceChild(newSpan,textNode);
    }
}

function processDocument() {
    let treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT,{
        acceptNode: function(node) { 
            if(node.textContent.length === 0) {
                return NodeFilter.FILTER_SKIP; //Skip empty text nodes
            } //else
            return NodeFilter.FILTER_ACCEPT;
        }
    }, false );
    while(treeWalker.nextNode()) {
        handleTextNode(treeWalker.currentNode);
    }
}

var insertedNodes = [];
var observer = new WebKitMutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        for(var i = 0; i < mutation.addedNodes.length; i++)
            insertedNodes.push(mutation.addedNodes[i]);
    })
    console.log(insertedNodes);
});
observer.observe(document, {
    childList: true
});
console.log(insertedNodes);

window.onload = function() {
    processDocument();
    insertionQ('.stream-item').every(function(element){

        processDocument();
      });    

    // insertionQ('div').every(function(element){
    //     processDocument();
    //     console.log("updating");
    // });
  };

$(window).scroll(function () { processDocument(); });
