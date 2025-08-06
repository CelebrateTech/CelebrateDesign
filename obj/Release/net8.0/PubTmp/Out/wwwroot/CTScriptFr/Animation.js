/* Basic Animation Panel*/
// Add click event to all buttons with class 'Bn'
var buttons = document.getElementsByClassName('Bn');
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        // Get the animation type from the button's AnNe attribute
        let animationType = this.getAttribute('AnNe');
        let box = document.querySelector('.box');

        // Remove any existing animation classes
        box.className = box.className.replace(/\bAnFe(In|Out)\b/, '');

        // Add the new animation class
        box.className += ' ' + animationType;

        // Remove the animation class after 1 second
        setTimeout(function () {
            box.className = box.className.replace(animationType, '');
        }, 2000);
    });
}

//function loadNewContent() {
//    console.log('Loading new content...');
//    // simulate loading new content (replace with your actual loading logic)
//    const newContent = '';
//    for (let i = 0; i < pageSize; i++) {
//        newContent += `<div class="content">Content ${currentPage * pageSize + i + 1}</div>`;
//    }
//    scrollContainer.insertAdjacentHTML('beforeend', newContent);

//    // animate the loading process
//    animateLoading();
//    currentPage++;
//}

//scrollContainer.addEventListener('scroll', () => {
//    console.log('Scroll event triggered!');
//    if (scrollContainer.scrollTop + scrollContainer.offsetHeight >= scrollContainer.scrollHeight) {
//        loadNewContent();
//    }
//});

