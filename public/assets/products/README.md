# دليل صور المنتجات — AuroraLuxe
# Guide des images produits — AuroraLuxe

---

## مقدمة | Introduction

هذا الدليل يشرح كيفية إضافة صور المنتجات إلى موقع AuroraLuxe.
Ce guide explique comment ajouter des photos de produits au site AuroraLuxe.

---

## 1. أين تضع صور ساعات الرجال؟ | Où mettre les photos montres homme ?

المسار: `public/assets/products/men/`
Chemin: `public/assets/products/men/`

```
public/
  assets/
    products/
      men/
        watch-men-001/      ← مجلد المنتج الأول
          main.webp         ← الصورة الرئيسية
          gallery-01.webp   ← صورة إضافية
          gallery-02.webp
          gallery-03.webp
        watch-men-002/
          main.webp
          gallery-01.webp
```

---

## 2. أين تضع صور ساعات النساء؟ | Où mettre les photos montres femme ?

المسار: `public/assets/products/women/`
Chemin: `public/assets/products/women/`

```
public/
  assets/
    products/
      women/
        watch-women-001/
          main.webp
          gallery-01.webp
        watch-women-002/
          main.webp
```

---

## 3. كيف تسمي مجلد المنتج؟ | Comment nommer le dossier produit ?

استخدم أسماء بسيطة بالأرقام:
Utilisez des noms simples avec des numéros :

- `watch-men-001` → ساعة رجالية رقم 1
- `watch-men-002` → ساعة رجالية رقم 2
- `watch-women-001` → ساعة نسائية رقم 1

**مهم:** لا تستخدم مسافات أو حروف عربية في اسم المجلد.
**Important:** N'utilisez pas d'espaces ou de caractères spéciaux dans le nom du dossier.

---

## 4. ما هي الصورة الرئيسية؟ | Quelle est l'image principale ?

الصورة الرئيسية دائماً اسمها `main.webp` أو `main.jpg`.
L'image principale s'appelle toujours `main.webp` ou `main.jpg`.

هذه الصورة هي التي تظهر في قائمة المنتجات.
C'est cette image qui apparaît dans la liste des produits.

---

## 5. كيف تضيف صور إضافية (gallery)؟ | Comment ajouter des photos supplémentaires ?

سمّي الصور الإضافية هكذا:
Nommez les photos supplémentaires ainsi :

```
gallery-01.webp
gallery-02.webp
gallery-03.webp
```

هذه الصور تظهر في صفحة تفاصيل المنتج عند النقر عليه.
Ces images apparaissent sur la page détail du produit.

---

## 6. كيف تضيف منتج جديد؟ | Comment ajouter un nouveau produit ?

### خطوة بخطوة | Étape par étape :

**الخطوة 1:** أنشئ مجلداً جديداً
```
public/assets/products/men/watch-men-013/
```

**الخطوة 2:** ضع الصور في المجلد
```
watch-men-013/
  main.webp
  gallery-01.webp
  gallery-02.webp
```

**الخطوة 3:** سجّل الدخول إلى لوحة الإدارة
```
http://localhost:3000/admin/login
```

**الخطوة 4:** اذهب إلى "Produits" ثم انقر "Ajouter un produit"

**الخطوة 5:** أدخل بيانات المنتج:
- الاسم بالفرنسية
- الفئة: Homme أو Femme
- السعر بالدرهم
- الوصف

**الخطوة 6:** ارفع الصور عبر واجهة رفع الصور في النموذج

---

## 7. كيف تربط الصور بمنتج في قاعدة البيانات؟
## Comment associer des images à un produit dans la base de données ?

عند إنشاء أو تعديل منتج من لوحة الإدارة، يتم رفع الصور تلقائياً وحفظ مساراتها في قاعدة البيانات.
Lors de la création ou modification d'un produit depuis le tableau de bord, les images sont automatiquement téléchargées et leurs chemins sauvegardés en base de données.

للمنتجات الديمو (بيانات البذور)، المسارات محفوظة كـ:
Pour les produits démo (seed data), les chemins sont sauvegardés comme :
```
/assets/products/men/watch-men-001/main.webp
```

ضع الصور في نفس المسار تماماً.
Placez les images exactement à ce chemin.

---

## 8. كيف ترفع صور المنتجات عبر لوحة الإدارة؟
## Comment télécharger des images via le tableau de bord ?

1. افتح لوحة الإدارة: `http://localhost:3000/admin`
2. اذهب إلى **Produits**
3. انقر على منتج موجود أو **Ajouter un produit**
4. في قسم الصور، انقر على المنطقة المخصصة للرفع أو اسحب الصور إليها
5. يمكنك رفع عدة صور في نفس الوقت
6. الصورة الأولى المرفوعة ستكون الصورة الرئيسية تلقائياً
7. انقر **Enregistrer** لحفظ التغييرات

الصور المرفوعة عبر لوحة الإدارة تُحفظ في: `public/uploads/`
Les images téléchargées via le tableau de bord sont sauvegardées dans : `public/uploads/`

---

## 9. كيف تستبدل شعار AuroraLuxe؟ | Comment remplacer le logo AuroraLuxe ?

ضع ملف الشعار في:
Placez votre fichier logo dans :
```
public/assets/logo/auroraluxe-logo.svg
```

أو بصيغة PNG:
Ou en format PNG :
```
public/assets/logo/auroraluxe-logo.png
```

ثم عدّل ملف `components/layout/Header.tsx` لاستخدام الصورة بدلاً من النص.
Ensuite modifiez `components/layout/Header.tsx` pour utiliser l'image à la place du texte.

---

## 10. ما هي الصيغ والأبعاد الموصى بها؟
## Quels formats et dimensions sont recommandés ?

| الاستخدام | الصيغة | الأبعاد الموصى بها |
|-----------|--------|-------------------|
| صورة المنتج الرئيسية | WebP أو JPG | 800×800 pixels |
| صور الغاليري | WebP أو JPG | 800×800 pixels |
| صورة البانر | WebP أو JPG | 1920×1080 pixels |
| الشعار | SVG أو PNG | 200×60 pixels |

**نصيحة:** استخدم صيغة WebP لأنها أصغر حجماً وأسرع تحميلاً.
**Conseil :** Utilisez le format WebP car il est plus léger et plus rapide à charger.

---

## 11. كيف تتجنب مشاكل مسارات الصور؟
## Comment éviter les chemins d'images cassés ?

✅ صحيح:
```
/assets/products/men/watch-men-001/main.webp
```

❌ خطأ:
```
assets/products/men/watch-men-001/main.webp   (بدون / في البداية)
C:\images\watch.jpg                            (مسار Windows)
```

**قواعد مهمة:**
- دائماً ابدأ المسار بـ `/`
- لا تستخدم مسافات في اسم الملف
- استخدم حروف صغيرة فقط
- استخدم `-` بدلاً من `_` أو المسافات

---

## 12. كيف تغيّر صورة منتج دون تغيير ID المنتج؟
## Comment changer l'image sans modifier l'ID du produit ?

1. ارفع الصورة الجديدة في نفس المجلد بنفس الاسم
2. الصورة القديمة ستُستبدل تلقائياً
3. **أو:** ارفع صورة جديدة عبر لوحة الإدارة في نموذج تعديل المنتج

عبر لوحة الإدارة | Via le tableau de bord :
1. Admin → Produits → تعديل المنتج
2. احذف الصورة القديمة من قائمة الصور
3. ارفع الصورة الجديدة
4. احفظ التغييرات

المنتج يحتفظ بنفس ID وكل الطلبات القديمة ستبقى صحيحة.
Le produit garde son même ID et toutes les anciennes commandes restent correctes.

---

## مثال عملي | Exemple pratique

إضافة ساعة رجالية اسمها "Classic Black" مع صورة رئيسية وثلاث صور إضافية:
Ajouter une montre homme appelée "Classic Black" avec une photo principale et trois photos supplémentaires :

**الخطوة 1 — إنشاء المجلد:**
```
public/assets/products/men/watch-men-013/
```

**الخطوة 2 — نقل الصور:**
```
watch-men-013/
  main.webp          ← الصورة الأمامية الرئيسية
  gallery-01.webp    ← صورة جانبية
  gallery-02.webp    ← تفاصيل الميناء
  gallery-03.webp    ← صورة على المعصم
```

**الخطوة 3 — إضافة المنتج عبر لوحة الإدارة:**
- الاسم: `Montre Homme Classic Black`
- الفئة: `MEN` (Homme)
- السعر: `2500`
- وصف المنتج: `Montre classique pour homme, design élégant et intemporel.`
- ارفع الصور من المجلد الذي أنشأته

**النتيجة:** ستظهر الساعة في `/collections/homme` وفي الصفحة الرئيسية إذا كانت مميزة.

---

## ملاحظات مهمة | Notes importantes

⚠️ **للإنتاج:** الصور المرفوعة على خادم Vercel ستُحذف عند كل نشر جديد.
⚠️ **Pour la production :** Les images uploadées sur Vercel seront supprimées à chaque nouveau déploiement.
حل: استخدم Cloudinary أو AWS S3 لتخزين الصور.
Solution : Utilisez Cloudinary ou AWS S3 pour stocker les images.

✅ **للمضيف VPS:** الصور محفوظة بأمان في `public/uploads/` وتبقى بعد التحديثات.
✅ **Pour l'hébergeur VPS :** Les images sont sauvegardées dans `public/uploads/` et restent après les mises à jour.

---

*آخر تحديث: 2025 | Dernière mise à jour: 2025*
