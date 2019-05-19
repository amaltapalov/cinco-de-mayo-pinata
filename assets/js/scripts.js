
window.onload = function(){
	const clipBoard = new ClipboardJS('#copy-coupon');

	clipBoard.on('success', function(e) {
	    let el = document.getElementById('copied');
	    	el.style.display = 'block';
	    e.clearSelection();
	});
}
