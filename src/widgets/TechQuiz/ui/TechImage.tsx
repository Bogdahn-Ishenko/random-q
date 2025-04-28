'use client';

import Image from 'next/image';
import styled from 'styled-components';

/** Стилизованная обертка для изображения с эффектом тени при наведении */
const WrapperImage = styled.div<{ color: string }>`
  display: inline-block;
  line-height: 0;
  position: relative;

  img {
    transition: filter 0.2s ease-in-out;
    will-change: filter;
    &:hover {
      filter: drop-shadow(0 0 2em ${(props) => props.color});
    }
  }
`;

/**
 * Компонент изображения технологии с эффектом при наведении
 * @param props.techName - Название технологии для загрузки SVG
 * @param props.alt - Альтернативный текст для изображения
 * @param props.width - Ширина изображения
 * @param props.height - Высота изображения
 * @param props.color - Цвет свечения при наведении
 * @param props.onError - Callback при ошибке загрузки изображения
 */
export default function ({
  techName,
  alt,
  width,
  height,
  color,
  onError,
}: {
  techName: string;
  alt: string;
  width: number;
  height: number;
  color: string;
  onError?: () => void;
}) {
  return (
    <WrapperImage color={color}>
      <Image
        src={`/tech-images/${techName}.svg`}
        alt={alt}
        width={width}
        height={height}
        priority={true}
        onError={onError}
      />
    </WrapperImage>
  );
}
