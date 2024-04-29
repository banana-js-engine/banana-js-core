#include <stdlib.h>
#include <stdio.h>
#include <emmintrin.h> // Include SIMD intrinsics header
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
void mat4_multiply(float* a, const float* b) {

    __m128 row1 = _mm_load_ps(&a[0]);
    __m128 row2 = _mm_load_ps(&a[4]);
    __m128 row3 = _mm_load_ps(&a[8]);
    __m128 row4 = _mm_load_ps(&a[12]);

    for (int i = 0; i < 4; ++i) {
        __m128 brod1 = _mm_set1_ps(b[i * 4]);
        __m128 brod2 = _mm_set1_ps(b[i * 4 + 1]);
        __m128 brod3 = _mm_set1_ps(b[i * 4 + 2]);
        __m128 brod4 = _mm_set1_ps(b[i * 4 + 3]);
        __m128 row = _mm_add_ps(
            _mm_add_ps(
                _mm_mul_ps(brod1, row1),
                _mm_mul_ps(brod2, row2)),
            _mm_add_ps(
                _mm_mul_ps(brod3, row3),
                _mm_mul_ps(brod4, row4)));
        _mm_store_ps(&a[i * 4], row);
    }
}

EMSCRIPTEN_KEEPALIVE
void mat4_apply_rotation_z(float* mat, float cos, float sin) {

    __m128 cos_vec = _mm_set1_ps(cos);
    __m128 sin_vec = _mm_set1_ps(sin);
    __m128 nsin_vec = _mm_set1_ps(-sin);

    __m128 m0 = _mm_load_ps(&mat[0]);
    __m128 m1 = _mm_load_ps(&mat[4]);

    __m128 row1 = _mm_add_ps(_mm_mul_ps(cos_vec, m0), _mm_mul_ps(nsin_vec, m1));
    m1 = _mm_add_ps(_mm_mul_ps(sin_vec, m0), _mm_mul_ps(cos_vec, m1));

    _mm_store_ps(&mat[0], row1);
    _mm_store_ps(&mat[4], m1);
}

EMSCRIPTEN_KEEPALIVE
void mat4_apply_scale(float* data, const float x, const float y, const float z) {
    __m128 x_vec = _mm_set1_ps(x); 
    __m128 y_vec = _mm_set1_ps(y); 
    __m128 z_vec = _mm_set1_ps(z); 

    __m128 data0_3 = _mm_load_ps(&data[0]);
    __m128 data4_7 = _mm_load_ps(&data[4]);
    __m128 data8_11 = _mm_load_ps(&data[8]);

    data0_3 = _mm_mul_ps(data0_3, x_vec);

    data4_7 = _mm_mul_ps(data4_7, y_vec);

    data8_11 = _mm_mul_ps(data8_11, z_vec);

    _mm_store_ps(&data[0], data0_3);
    _mm_store_ps(&data[4], data4_7);
    _mm_store_ps(&data[8], data8_11);
}
