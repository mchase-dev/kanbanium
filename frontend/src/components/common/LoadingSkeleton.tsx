import { Skeleton } from 'antd';
import type { SkeletonProps } from 'antd';

interface LoadingSkeletonProps extends SkeletonProps {
  count?: number;
}

/**
 * Reusable loading skeleton component
 * Uses Ant Design Skeleton for consistent loading states
 */
export default function LoadingSkeleton({ count = 1, ...props }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} active {...props} />
      ))}
    </>
  );
}

/**
 * Skeleton for text content
 */
export function TextSkeleton({ rows = 3 }: { rows?: number }) {
  return <Skeleton active paragraph={{ rows }} title={false} />;
}

/**
 * Skeleton for avatar with text
 */
export function AvatarTextSkeleton() {
  return <Skeleton active avatar paragraph={{ rows: 2 }} />;
}

/**
 * Skeleton for input fields
 */
export function InputSkeleton() {
  return <Skeleton.Input active block />;
}

/**
 * Skeleton for buttons
 */
export function ButtonSkeleton({ block = false }: { block?: boolean }) {
  return <Skeleton.Button active block={block} />;
}

/**
 * Skeleton for images
 */
export function ImageSkeleton() {
  return <Skeleton.Image active />;
}
