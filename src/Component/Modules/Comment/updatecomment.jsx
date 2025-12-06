import { useState } from 'react'
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';
import AppButton from '../../Common/Buttton/button';
import CommonTextInput from '../../Common/MultiSelect/CommonTextInput';
import PropTypes from 'prop-types';

const UpdateComment = ({ onClose, comment, resourceId, GetCommentList }) => {
  const [newComment, setNewComment] = useState(comment.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = Cookies.get("accessToken");

  const handleUpdate = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      console.log("Updated", comment)
      const response = await axios.put(`${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/comment/${resourceId}`,
        {
          comment_id: comment.id,
          comment: newComment,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Updated", comment);
      toast.success("Comment updated successfully");
      GetCommentList()
      console.log("Updated Comment:", response.data);
      onClose()

    } catch (error) {
      toast.error(error.response?.data?.detail || "Error while updating comment");
      console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="popup-overlay" style={{ padding: '150px 100px 0px 0px' }}>
      <div className="popup-container">
        <button className="close-icon" onClick={onClose}>
          &times;
        </button>
        <div className="popup-content">
          <form onSubmit={handleUpdate}>

            {/* <label htmlFor="title">Update Comment:</label> */}
            <CommonTextInput
              label="Update Comment"
              // className="com"
              type="text"
              id="title"
              name="title"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment"
              required
            />

            <div className="button-container">
              <AppButton type="submit" className="create-btn" disabled={isSubmitting}>{isSubmitting ? 'Editing...' : 'Edit'}</AppButton>
              <AppButton type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>

  )
}
UpdateComment.propTypes = {
  onClose: PropTypes.func.isRequired,
  comment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    comment: PropTypes.string.isRequired,
  }).isRequired,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  GetCommentList: PropTypes.func.isRequired,
};
export default UpdateComment;