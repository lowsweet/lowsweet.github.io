# 原站银河直接移植
用户确认要求直接clone Stars，仅替换 Landing 背景，工作区继续暂停。

## 原样镜像
public/stars-clone/js/three.min.js：原站Three r62。
js/galaxy.js、js/lensflare.js、shaders/galacticstars.vsh/.fsh、galactic_sharp/blur/top贴图、lensflare0–3、glowspan。所有原始文件保持byte-for-byte，SHA256与源URL在upstream-manifest.json。

## 运行层
使用同源隔离iframe /stars-clone/scene.html，保留源全局变量，不污染React/现代Three全局。源100000星点五臂、150000银河面片、复合LensFlare、原混合/景深/颜色空间。enableDust=false遵循main源设置。隐藏源站业务UI/自动游览，首页仍是LinkeAI。
Source galaxy的原局部position与rotation未改；外部rig固定用户要求的LL→UR斜视，盘面靠近的一侧位于画面左上，深空位于右下。静态取景与正文暗遮罩是首页所需适配。
相机保留source.scale.z=.83、near=.5、far=10000000和主循环FOV40。最大距离80000，滚动依照8关键帧连续到14400。Source camera阻尼.125换为与帧率无关的等效值。
绘制前暖机24次source update，使原面片opacity完成渐入；之后在停止滚动/窗口变化后停止rAF。固定随机种子仅用于原source generateGalaxy的Math.random。

## 边界
此范围移植原站银河视觉层；未接入太阳系操作、恒星详情、热力图、tour、统计/追踪，也不引入真实业务数据。
组件使用postMessage（校验origin+source）控制camera，DOM data标明original-stars/r62/100000。所有依赖和资源均本地文件。
