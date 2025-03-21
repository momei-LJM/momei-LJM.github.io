<template>
  <canvas ref="canvas" class="particle-canvas"></canvas>
</template>

<script lang="ts">
import { useAppStore } from "valaxy";
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from "vue";

interface Particle {
  x: number;
  y: number;
  char: string;
  fontSize: number;
  dx: number;
  dy: number;
}

export default defineComponent({
  name: "ParticleBackground",
  setup() {

    const appStore = useAppStore()


    const canvas = ref<HTMLCanvasElement | null>(null);
    const particles = ref<Particle[]>([]);
    const baseParticleCount = 100; // 基础粒子数量
    const minParticleCount = 30; // 最小粒子数量（移动端）
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const colors = {
      light: "rgba(0, 108, 208, 0.7)", // Light 模式下的粒子颜色
      dark: "rgba(255, 255, 255, 0.7)", // Dark 模式下的粒子颜色
    };
    let currentColor = colors.dark;

    // 初始化画布大小
    const resizeCanvas = () => {
      if (!canvas.value) return;
      const ctx = canvas.value.getContext("2d");
      if (!ctx) return;

      canvas.value.width = window.innerWidth;
      canvas.value.height = window.innerHeight;

      // 根据视口大小调整粒子数量
      adjustParticleCount();
    };

    // 根据视口大小调整粒子数量
    const adjustParticleCount = () => {
      if (!canvas.value) return;

      const width = canvas.value.width;
      const height = canvas.value.height;

      // 根据视口面积动态计算粒子数量
      const area = width * height;
      const targetCount = Math.max(
        minParticleCount,
        Math.floor((area / (1920 * 1080)) * baseParticleCount)
      );

      // 调整粒子数组
      if (particles.value.length > targetCount) {
        particles.value = particles.value.slice(0, targetCount);
      } else {
        while (particles.value.length < targetCount) {
          particles.value.push(createParticle(canvas.value));
        }
      }
    };

    // 创建单个粒子
    const createParticle = (canvas: HTMLCanvasElement): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: getRandomCharacter(),
        fontSize: Math.random() * 20 + 10, // 字体大小
        dx: Math.random() - 0.5,
        dy: Math.random() - 0.5,
      };
    };

    // 初始化粒子
    const initParticles = () => {
      if (!canvas.value) return;
      particles.value = [];
      adjustParticleCount();
    };

    // 获取随机字符
    const getRandomCharacter = (): string => {
      const index = Math.floor(Math.random() * characters.length);
      return characters[index];
    };

    // 更新颜色模式
    const updateColorScheme = () => {
      currentColor = appStore.isDark ? colors.dark : colors.light;
    };

    watch(() => appStore.isDark, () => {
      updateColorScheme()
    })

    // 绘制粒子
    const drawParticles = () => {
      if (!canvas.value) return;
      const ctx = canvas.value.getContext("2d");
      if (!ctx) return;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);

        particles.value.forEach((particle) => {
          ctx.beginPath();
          ctx.font = `${particle.fontSize}px Arial`; // 设置字体大小和样式
          ctx.fillStyle = currentColor; // 动态设置粒子颜色
          ctx.fillText(particle.char, particle.x, particle.y); // 绘制字符
          ctx.closePath();

          particle.x += particle.dx;
          particle.y += particle.dy;

          // 反弹逻辑
          if (particle.x < 0 || particle.x > canvas.value!.width) particle.dx *= -1;
          if (particle.y < 0 || particle.y > canvas.value!.height) particle.dy *= -1;
        });

        requestAnimationFrame(animate);
      };

      animate();
    };

    // 生命周期钩子
    onMounted(() => {
      resizeCanvas();
      initParticles();
      updateColorScheme();
      // 监听窗口大小变化
      window.addEventListener("resize", resizeCanvas);

      // 开始绘制粒子
      drawParticles();
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeCanvas);
    });

    return {
      canvas,
    };
  },
});
</script>

<style>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
