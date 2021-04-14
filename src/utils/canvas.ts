export const setupCanvas = (
	canvas,
	width = 0,
	height = 0,
	pixelRatio = 1,
	compositeType = "normal"
) => {
	if (!canvas) return;
	if (height === 0) height = 500;
	const ctx = canvas.getContext("2d");
	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;

	console.log(canvas.height);
	ctx.scale(pixelRatio, pixelRatio);
	ctx.translate(width / 2, height / 2);

	ctx.globalCompositeOperation = compositeType;

	return ctx;
};
