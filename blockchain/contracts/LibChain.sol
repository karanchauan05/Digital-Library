// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LibChain
 * @dev A digital library for educational content with royalty distribution and access control.
 */
contract LibChain is Ownable, ReentrancyGuard {
    struct Content {
        uint256 id;
        string title;
        string description;
        string previewUrl; // Publicly accessible preview (e.g., cover image or snippet)
        string contentHash; // Encrypted or hidden IPFS hash
        uint256 price;
        address payable creator;
        uint256 royaltyPercentage; // Percentage of resale/restock (kept simple for this MVP)
        bool isActive;
        bool isDeleted;
    }

    uint256 public contentCount;
    mapping(uint256 => Content) public contents;
    mapping(uint256 => mapping(address => bool)) public hasAccess;

    event ContentRegistered(uint256 indexed id, string title, address indexed creator, uint256 price);
    event ContentPurchased(uint256 indexed id, address indexed buyer, uint256 price);
    event ContentToggled(uint256 indexed id, bool isActive);
    event ContentDeleted(uint256 indexed id);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register new educational content.
     */
    function registerContent(
        string memory _title,
        string memory _description,
        string memory _previewUrl,
        string memory _contentHash,
        uint256 _price,
        uint256 _royaltyPercentage
    ) external {
        require(_royaltyPercentage <= 30, "Royalty percentage too high (max 30%)");
        require(_price > 0, "Price must be greater than 0");

        contentCount++;
        contents[contentCount] = Content({
            id: contentCount,
            title: _title,
            description: _description,
            previewUrl: _previewUrl,
            contentHash: _contentHash,
            price: _price,
            creator: payable(msg.sender),
            royaltyPercentage: _royaltyPercentage,
            isActive: true,
            isDeleted: false
        });

        // Creator automatically has access
        hasAccess[contentCount][msg.sender] = true;

        emit ContentRegistered(contentCount, _title, msg.sender, _price);
    }

    /**
     * @dev Purchase access to content.
     */
    function purchaseContent(uint256 _contentId) external payable nonReentrant {
        Content storage content = contents[_contentId];
        require(content.isActive, "Content is not available for purchase");
        require(!content.isDeleted, "Content has been deleted");
        require(msg.value >= content.price, "Insufficient payment");
        require(!hasAccess[_contentId][msg.sender], "You already have access to this content");

        // Transfer funds directly to the creator
        // In a more complex system, we might handle platform fees here
        (bool success, ) = content.creator.call{value: msg.value}("");
        require(success, "Transfer to creator failed");

        hasAccess[_contentId][msg.sender] = true;

        emit ContentPurchased(_contentId, msg.sender, msg.value);
    }

    /**
     * @dev Toggle content visibility.
     */
    function toggleContentStatus(uint256 _contentId) external {
        require(contents[_contentId].creator == msg.sender, "Only creator can toggle status");
        require(!contents[_contentId].isDeleted, "Cannot toggle deleted content");
        contents[_contentId].isActive = !contents[_contentId].isActive;
        emit ContentToggled(_contentId, contents[_contentId].isActive);
    }

    /**
     * @dev Permanently delete content.
     */
    function deleteContent(uint256 _contentId) external {
        require(contents[_contentId].creator == msg.sender, "Only creator can delete");
        contents[_contentId].isDeleted = true;
        contents[_contentId].isActive = false;
        emit ContentDeleted(_contentId);
    }

    /**
     * @dev Check if a user has access to content.
     */
    function checkAccess(uint256 _contentId, address _user) external view returns (bool) {
        if (contents[_contentId].isDeleted && contents[_contentId].creator != _user) return false;
        return hasAccess[_contentId][_user];
    }

    /**
     * @dev Retrieve content hash for authorized users only.
     * Note: This is an on-chain check, but anyone can query historical state.
     * For true anti-piracy, contentHash should be an encrypted string.
     */
    function getContentHash(uint256 _contentId) external view returns (string memory) {
        require(!contents[_contentId].isDeleted, "Content has been deleted");
        require(hasAccess[_contentId][msg.sender], "Access denied: Purchase required");
        return contents[_contentId].contentHash;
    }
}
