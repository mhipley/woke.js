
var er = require('easy-replace');

var elements = document.getElementsByTagName('*');

var dillweeds = require('./woke.json');

function replaceDillweed(dillweed) {
    var random = Math.floor(Math.random() * dillweeds[dillweed].length);
    if (dillweeds[dillweed][random].position == 'before') {
        var dillweedString = '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span> ' + dillweeds[dillweed][random].lastname + ' ';
    }
    if (dillweeds[dillweed][random].position == 'after') {
        var dillweedString = dillweeds[dillweed][random].lastname + ', ' + '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span>, ';
    }
    if (dillweeds[dillweed][random].position == 'replace') {
        var dillweedString = '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span> ';
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

    // let finalHtml= er(
    //   newHtml,
    //   {
    //     leftOutsideNot: 'Donald ',
    //     leftOutside: '',
    //     leftMaybe: '',
    //     searchFor: 'Trump',
    //     rightMaybe: '',
    //     rightOutside: '',
    //     rightOutsideNot: ''
    //   },
    //   replaceDillweed("Trump")
    // );

    if( newHtml !== origText) {
        let newSpan = document.createElement('span');
        newSpan.innerHTML = newHtml;
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
};
